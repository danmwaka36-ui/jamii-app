export function getDashboardPath(role?: string) {
  switch (role) {
    case "police":
      return "/police";

    case "fire":
      return "/fire";

    case "ambulance":
      return "/ambulance";

    case "county":
      return "/county";

    case "redcross":
      return "/redcross";

    case "nyumbakumi":
      return "/nyumbakumi";

    case "admin":
      return "/admin";

    case "citizen":
    default:
      return "/dashboard";
  }
}