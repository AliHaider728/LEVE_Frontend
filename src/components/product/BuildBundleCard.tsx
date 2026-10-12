import { ArrowRight, PackagePlus } from "lucide-react";
import { Link } from "@/lib/router-compat";
export function BuildBundleCard() {
  return <Link to="/bundles/build" className="flex h-full min-h-80 min-w-0 flex-col justify-between gap-6 rounded-md bg-primary p-4 text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-4 sm:p-6">
    <PackagePlus className="size-8 shrink-0" />
    <div><h3 className="text-xl font-light leading-snug sm:text-2xl">Build your own bundle</h3>
      <p className="mt-3 text-sm leading-6">Choose your essentials and discover your routine savings.</p>
      <span className="mt-5 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wider">Start building <ArrowRight className="size-4" /></span>
    </div>
  </Link>;
}
