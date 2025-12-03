import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function Page() {
  return (
    <div className="Page">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
