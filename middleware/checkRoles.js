function checkRoles(...allowedRoles) {
  const normalizedRoles = allowedRoles.reduce((acc, entry) => {
    if (Array.isArray(entry)) {
      return acc.concat(entry);
    }
    if (entry) {
      acc.push(entry);
    }
    return acc;
  }, []);

  return (req, res, next) => {
    try {
      const role =
        req.user?.role || req.user?.user_role || req.body?.user_role || null;

      // Debug logging in development
      if (process.env.NODE_ENV === "development" && !role) {
        console.log("checkRoles debug - req.user:", JSON.stringify(req.user, null, 2));
        console.log("checkRoles debug - allowedRoles:", normalizedRoles);
      }

      if (!role) {
        return res
          .status(401)
          .json({ 
            error: "User role missing or unauthorized",
            debug: process.env.NODE_ENV === "development" ? { user: req.user, allowedRoles: normalizedRoles } : undefined
          });
      }

      if (!normalizedRoles.includes(role)) {
        const errorMessage = normalizedRoles.includes('owner') && role === 'customer'
          ? "Access denied. You must be a salon owner or admin to perform this action. Please create a salon first or contact support."
          : "Access denied";
        
        return res.status(403).json({ 
          error: errorMessage,
          debug: process.env.NODE_ENV === "development" ? { 
            userRole: role, 
            allowedRoles: normalizedRoles,
            user: req.user 
          } : undefined
        });
      }

      next();
    } catch (err) {
      console.error("Role check failed:", err);
      res.status(403).json({ error: "Access denied" });
    }
  };
}

module.exports = checkRoles;
