from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Notice
from notice.serializers import NoticeSerializer

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .parser import get_serializer
from .fcm import send_to_fcm

@swagger_auto_schema(
    method='post',
    operation_id='공지사항 등록(어드민)',
    operation_description='공지사항을 등록합니다',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'title': openapi.Schema(type=openapi.TYPE_STRING, description="공지사항 제목"),
            'content': openapi.Schema(type=openapi.TYPE_STRING, description="공지사항 내용"),
        }
    ),
    tags=['공지사항'],
    responses={status.HTTP_201_CREATED: ""}
)
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])  # 어드민 유저만 공지사항 작성 가능
@authentication_classes([JWTAuthentication])  # JWT 토큰 확인
def notice_create(request):
    serializer = NoticeSerializer(data=request.data)

    if serializer.is_valid(raise_exception=True):
        # JWT 인증 사용시 인증객체를 통해 인증을 진행하고 사용자 정보를 request.user 객체에 저장
        # 인증정보가 없거나 일치하지않으면 AnonymousUser를 저장
        notice = serializer.save(user=request.user)
        send_to_fcm(notice.title, notice.content, notice.id)
        
        return Response(status=status.HTTP_201_CREATED)

page = openapi.Parameter('page', openapi.IN_QUERY, default=1,
                        description="페이지 번호", type=openapi.TYPE_INTEGER)
size = openapi.Parameter('size', openapi.IN_QUERY, default=5,
                        description="한 페이지에 표시할 객체 수", type=openapi.TYPE_INTEGER)
title = openapi.Parameter('title', openapi.IN_QUERY, default="제목",
                        description="검색할 공지사항 제목", type=openapi.TYPE_STRING)
@swagger_auto_schema(
    method='get',
    operation_id='공지사항 전체 조회(아무나)',
    operation_description='공지사항 전체를 조회합니다',
    tags=['공지사항'],
    manual_parameters=[page, size],
    responses={status.HTTP_200_OK: openapi.Response(
        description="200 OK",
        schema=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'count': openapi.Schema(type=openapi.TYPE_STRING, description="전체 공지사항 게시글 수"),
                'next': openapi.Schema(type=openapi.TYPE_STRING, description="다음 조회 페이지 주소"),
                'previous': openapi.Schema(type=openapi.TYPE_STRING, description="이전 조회 페이지 주소"),
                'results' : get_serializer(NoticeSerializer, "공지사항 정보"),
            }
        )
    )}
)
@api_view(['GET'])
@permission_classes([AllowAny])  # 글 확인은 로그인 없이 가능
def notice_list(request):
    notice_list = Notice.objects.all()
    paginator = PageNumberPagination()
    
    if request.GET.get('title'):
        title = request.GET.get('title')
        notice_list = notice_list.filter(title__contains=title)
    # 페이지 사이즈를 주면 해당 사이즈로 지정
    # 값이 없으면 기본 사이즈로 설정(settings.py안에)
    page_size = request.GET.get('size') # request.GET['size']를 써도 되지만 size가 없다면 에러를 발생시킴
    if not page_size == None:           # request.GET.get('size')로 작성시 size가 없으면 None을 반환
        paginator.page_size = page_size

    result = paginator.paginate_queryset(notice_list, request)
    serializers = NoticeSerializer(result, many=True)
    return paginator.get_paginated_response(serializers.data)

@swagger_auto_schema(
    method='get',
    operation_id='공지사항 상세 조회(아무나)',
    operation_description='공지사항을 조회 합니다',
    tags=['공지사항'],
    responses={status.HTTP_200_OK: NoticeSerializer},
)
@api_view(['GET'])
@permission_classes([AllowAny])  # 글 확인은 로그인 없이 가능
def notice_detail(request, pk):
    notice = get_object_or_404(Notice, pk=pk)
    serializer = NoticeSerializer(notice)

    return Response(serializer.data, status=status.HTTP_200_OK)

@swagger_auto_schema(
    method='put',
    operation_id='공지사항 수정(어드민)',
    operation_description='공지사항을 수정합니다',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'title': openapi.Schema(type=openapi.TYPE_STRING, description="수정할 공지사항 제목"),
            'content': openapi.Schema(type=openapi.TYPE_STRING, description="수정할 공지사항 내용"),
        }
    ),
    tags=['공지사항'],
    responses={status.HTTP_200_OK: ""}
)
@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdminUser])  # 어드민 유저만 공지사항 수정 가능
@authentication_classes([JWTAuthentication])  # JWT 토큰 확인
def notice_update(request, pk):
    notice = get_object_or_404(Notice, pk=pk)
    # instance를 지정해줘야 수정될 때 해당 정보가 먼저 들어간 뒤 수정(안정적이다)
    serializer = NoticeSerializer(instance=notice, data=request.data)

    if serializer.is_valid(raise_exception=True):
        serializer.save()
        return Response(status=status.HTTP_200_OK)

@swagger_auto_schema(
    method='delete',
    operation_id='공지사항 삭제(어드민)',
    operation_description='공지사항을 제거합니다',
    tags=['공지사항'],
    responses={status.HTTP_200_OK: ""}
)    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])  # 어드민 유저만 공지사항 삭제 가능
@authentication_classes([JWTAuthentication])  # JWT 토큰 확인
def notice_delete(request, pk):
    notice = get_object_or_404(Notice, pk=pk)
    notice.delete()
    return Response(status=status.HTTP_200_OK)
