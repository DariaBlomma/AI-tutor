import { createFileRoute } from '@tanstack/react-router';
import { AuthSignUpView } from "@/auth/ui/views/AuthSignUpView/AuthSignUpView.tsx";

export const Route = createFileRoute('/auth/sign-up')({
    component: () => (
            <AuthSignUpView />
    ),
});