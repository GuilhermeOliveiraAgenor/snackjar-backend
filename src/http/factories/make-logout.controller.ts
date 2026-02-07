import { LogoutController } from "../controllers/user/logout.controller";

export function MakeLogoutController() {
  return new LogoutController();
}
