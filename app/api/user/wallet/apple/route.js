import { issueWallet } from "@/util/wallet/issue-route";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const GET = (request) => issueWallet(request, "apple");
