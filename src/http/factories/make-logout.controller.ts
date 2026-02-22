import { LogoutController } from "../controllers/user/logout.controller";

export function makeLogoutController() {
  return new LogoutController();
}
