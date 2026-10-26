import {createFileRoute} from '@tanstack/react-router';
import { AuthLoginView } from "../../auth/ui/views/AuthLoginView/AuthLoginView.tsx";

export const Route = createFileRoute('/auth/login')({
    component: () => (
            <AuthLoginView />
    ),
});