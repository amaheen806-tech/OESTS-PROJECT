from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Only allows users whose role is 'admin'."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')


class IsDonor(BasePermission):
    """Only allows users whose role is 'donor'."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'donor')


class IsSchool(BasePermission):
    """Only allows users whose role is 'school'."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'school')


class IsOrphan(BasePermission):
    """Only allows users whose role is 'orphan' (submitted by the guardian)."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'orphan')
