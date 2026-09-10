import { websiteApi } from "@/util/auth/website-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const handle = async (request, { params }) => websiteApi(request, (await params).path);
export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE, handle as HEAD };
