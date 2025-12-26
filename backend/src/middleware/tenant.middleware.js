export const tenantIsolation = (req, res, next) => {
  // Super admin can access all tenants
  if (req.user.role === 'super_admin') {
    return next();
  }

  // Tenant user must have tenantId
  if (!req.user.tenantId) {
    return res.status(403).json({
      success: false,
      message: 'Tenant context missing',
    });
  }

  /**
   * Attach tenantId to request for controllers to use
   * Controllers MUST use req.tenantId
   * NEVER trust req.body.tenantId or req.params.tenantId
   */
  req.tenantId = req.user.tenantId;

  next();
};
