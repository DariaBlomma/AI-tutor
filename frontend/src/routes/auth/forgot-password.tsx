import {createFileRoute} from '@tanstack/react-router';
import {AuthForgotPasswordView} from "../../auth/ui/views/AuthForgotPasswordView/AuthForgotPasswordView.tsx";

export const Route = createFileRoute('/auth/forgot-password')({
    component: AuthForgotPasswordView,
});