import type { Metadata } from "next";
import { Suspense } from "react";
import { Building } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginForm } from "@/components/auth/login-form";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="items-center text-center">
        <div className="bg-primary text-primary-foreground mb-2 flex size-11 items-center justify-center rounded-xl">
          <Building className="size-5" />
        </div>
        <CardTitle className="text-xl">{siteConfig.name}</CardTitle>
        <CardDescription>
          Entre com suas credenciais para acessar o sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<Skeleton className="h-56 w-full" />}>
          <LoginForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
