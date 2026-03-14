import { Body, Controller, Post } from '@nestjs/common';
import { SignUpOrganizerUseCase } from '../../application/use-cases/signup-organizer.use-case';
import { LoginOrganizerUseCase } from '../../application/use-cases/login-organizer.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signupUseCase: SignUpOrganizerUseCase,
    private readonly loginUseCase: LoginOrganizerUseCase,
  ) {}

  @Post('signup')
  async signup(@Body() body: any) {
    return this.signupUseCase.execute(body.phone, body.password);
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.loginUseCase.execute(body.phone, body.password);
  }
}
