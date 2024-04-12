import { Suspense } from "react";
import LoginForm from "../components/LoginForm";

export default function Page() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
