import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/config";
import AccountClient from "./account-client";

export const metadata: Metadata = {
  title: `My Reviews | ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <AccountClient />;
}
