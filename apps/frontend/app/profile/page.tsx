import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const ProfileUI = dynamic(() => import("./profileUI"), {
  loading: () => <div className="w-full h-full bg-stone-100" />,
});

export const metadata: Metadata = {
  title: "프로필",
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="w-full h-full bg-stone-100" />}>
      <ProfileUI />
    </Suspense>
  );
}
