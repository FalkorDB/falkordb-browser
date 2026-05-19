import { Suspense } from "react";
import LoginPage from "./LoginPage";

export default function Page() {
  return (
    <div className="Page">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginPage />
      </Suspense>
    </div>
  );
}
