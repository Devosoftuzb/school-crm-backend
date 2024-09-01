import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) { }

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest();
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new UnauthorizedException({
                message: "Authorization header missing",
            });
        }

        const [bearer, token] = authHeader.split(' ');

        if (bearer !== 'Bearer' || !token) {
            throw new UnauthorizedException({
                message: "Invalid token format",
            });
        }

        try {
            const user = this.jwtService.verify(token, { secret: process.env.REFRESH_TOKEN_KEY });
            req.user = user;
        } catch (error) {
            throw new UnauthorizedException({
                message: "Invalid or expired token",
            });
        }

        return true;
    }
}
