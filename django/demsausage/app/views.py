from django.contrib.auth.models import User
from django.contrib.auth import logout
from django.http import HttpResponseNotFound
from django.core.cache import cache
from django.db import transaction

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.decorators import list_route, detail_route
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from rest_framework.exceptions import APIException
from rest_framework import generics
from rest_framework import mixins

from demsausage.app.models import Elections, PollingPlaces, Stalls, PollingPlaceFacilityType
from demsausage.app.serializers import UserSerializer, ElectionsSerializer, ElectionsStatsSerializer, PollingPlaceFacilityTypeSerializer, PollingPlacesSerializer, PollingPlacesGeoJSONSerializer, PollingPlaceSearchResultsSerializer, StallsSerializer, PendingStallsSerializer
from demsausage.app.permissions import AnonymousOnlyList, AnonymousOnlyCreate
from demsausage.app.filters import PollingPlacesBaseFilter, PollingPlacesFilter, PollingPlacesNearbyFilter
from demsausage.app.enums import StallStatus
from demsausage.app.sausage.polling_places import get_cache_key
from demsausage.util import make_logger

logger = make_logger(__name__)


def api_not_found(request):
    return HttpResponseNotFound()


class CurrentUserView(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            serializer = UserSerializer(
                request.user, context={'request': request}
            )

            return Response({
                "is_logged_in": True,
                "user": serializer.data
            })
        else:
            return Response({
                "is_logged_in": False,
                "user": None
            })


class LogoutUserView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        logout(request)
        return Response({})


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = (IsAdminUser,)


class ProfileViewSet(viewsets.ViewSet):
    """
    API endpoint that allows user profiles to be viewed and edited.
    """
    permission_classes = (IsAuthenticated,)

    @list_route(methods=['post'])
    def update_settings(self, request):
        request.user.profile.merge_settings(request.data)
        request.user.profile.save()
        return Response({"settings": request.user.profile.settings})

    @list_route(methods=['get'])
    def get_column_position(self, request, format=None):
        qp = request.query_params
        columnId = str(qp["id"]) if "id" in qp else None

        if "column_positions" in request.user.profile.settings and columnId in request.user.profile.settings["column_positions"]:
            return Response({"position": request.user.profile.settings["column_positions"][columnId]})
        else:
            return Response({"position": None})


class ElectionsViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows elections to be viewed and edited.
    """
    queryset = Elections.objects
    serializer_class = ElectionsSerializer
    permission_classes = (AnonymousOnlyList,)

    def get_queryset(self):
        if self.request.user.is_anonymous is True:
            return self.queryset.filter(is_hidden=False).order_by("-id")
        return self.queryset.order_by("-id")

    def get_serializer_class(self):
        if self.request.user.is_anonymous is True:
            return self.serializer_class
        return ElectionsStatsSerializer

    @detail_route(methods=['post'], permission_classes=(IsAuthenticated,))
    @transaction.atomic
    def set_primary(self, request, pk=None, format=None):
        self.get_queryset().filter(is_primary=True).update(is_primary=False)

        serializer = ElectionsSerializer(self.get_object(), data={"is_primary": True}, partial=True)
        if serializer.is_valid() is True:
            serializer.save()
            return Response({})
        else:
            raise APIException(serializer.errors)


class PollingPlaceFacilityTypeViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    API endpoint that allows polling place facility types to be viewed.
    """
    queryset = PollingPlaceFacilityType.objects
    serializer_class = PollingPlaceFacilityTypeSerializer
    permission_classes = (IsAuthenticated,)


class PollingPlacesViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows polling places to be viewed and edited.
    """
    queryset = PollingPlaces.objects.all().order_by("-id")
    serializer_class = PollingPlacesSerializer
    permission_classes = (AllowAny,)
    filter_class = PollingPlacesFilter


class PollingPlacesNearbyViewSet(generics.ListAPIView):
    """
    API endpoint that allows polling places to be searched by a lat,lon coordinate pair.
    """
    queryset = PollingPlaces.objects
    serializer_class = PollingPlaceSearchResultsSerializer
    permission_classes = (AllowAny,)
    filter_class = PollingPlacesNearbyFilter


class PollingPlacesGeoJSONViewSet(generics.ListAPIView):
    """
    API endpoint that allows polling places to be retrieved as GeoJSON.
    """
    queryset = PollingPlaces.objects
    serializer_class = PollingPlacesGeoJSONSerializer
    permission_classes = (AllowAny,)
    filter_class = PollingPlacesBaseFilter

    def list(self, request, format=None):
        regenerate_cache = True if self.request.query_params.get("regenerate_cache", None) is not None else False
        cache_key = get_cache_key(self.request.query_params.get("election_id"))

        if regenerate_cache is False and cache_key in cache:
            return Response(cache.get(cache_key))

        response = super(PollingPlacesGeoJSONViewSet, self).list(request, format)
        cache.set(cache_key, response.data)

        if regenerate_cache is True:
            return Response({})
        return response


class StallsViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows stalls to be viewed and edited.
    """
    queryset = Stalls.objects
    serializer_class = StallsSerializer
    permission_classes = (AnonymousOnlyCreate,)


class PendingStallsViewSet(generics.ListAPIView):
    """
    API endpoint that allows pending stalls to be viewed and edited.
    """
    queryset = Stalls.objects.filter(status=StallStatus.PENDING).order_by("-id")
    serializer_class = PendingStallsSerializer
    permission_classes = (IsAuthenticated,)
