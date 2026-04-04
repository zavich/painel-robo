"use client";

import Loading from "@/components/Loading";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/dashboard");
    }, 2000);

    return () => clearTimeout(timeout);
  }, [router]);

  return <Loading />;
}
