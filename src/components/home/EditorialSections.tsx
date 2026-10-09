import { Link } from "@/lib/router-compat";
import { editorialImages } from "@/lib/assets";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EditorialSections() {
  return (
    <>
      <section className="grid min-h-svh bg-accent md:grid-cols-2">
        <div className="relative min-h-[60vh] overflow-hidden">
          <img
            src={editorialImages.portrait}
            alt="Woman in an editorial skincare portrait"
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/55 via-transparent to-transparent" />
          <span className="absolute right-5 top-5 text-8xl font-light text-primary-foreground">
            03
          </span>
        </div>
        <div className="flex flex-col justify-center px-6 py-20 text-foreground md:px-[8vw]">
          <p className="eyebrow mb-10">Formula / Feeling</p>
          <h2 className="text-6xl font-light leading-none md:text-8xl">
            Made to meet the skin, not mask it.
          </h2>
          <p className="mt-10 max-w-md text-base leading-7">
            Each LEVA placeholder is prepared for a considered formula: precise in purpose, quiet in
            presentation, pleasurable in practice.
          </p>
        </div>
      </section>
      <section className="px-5 py-28 md:px-[7vw] md:py-44">
        <div className="mb-16 flex items-end justify-between">
          <p className="eyebrow">Editorial studies</p>
          <p className="max-w-xs text-right font-display text-2xl">
            Light, touch, and the face we return to.
          </p>
        </div>
        <div className="grid grid-cols-12 gap-4 md:gap-8">
          <img
            src={editorialImages.portrait}
            alt="Editorial portrait"
            loading="lazy"
            className="col-span-8 aspect-[4/5] w-full object-cover md:col-span-5"
          />
          <img
            src={editorialImages.closeup}
            alt="Close-up skincare detail"
            loading="lazy"
            className="col-span-7 col-start-6 mt-24 aspect-[3/4] w-full object-cover md:col-span-4 md:col-start-8 md:mt-40"
          />
          <img
            src={editorialImages.skin}
            alt="Radiant skin detail"
            loading="lazy"
            className="col-span-5 col-start-2 -mt-10 aspect-square w-full object-cover md:col-span-3 md:col-start-5 md:-mt-28"
          />
        </div>
      </section>
      <section className="overflow-hidden bg-primary py-28 text-primary-foreground md:py-40">
        <p className="whitespace-nowrap font-display text-[15vw] leading-none">
          FOR HER — AT HER PACE —
        </p>
        <div className="mx-auto mt-20 grid max-w-6xl gap-12 px-6 md:grid-cols-3">
          <blockquote className="font-display text-3xl">
            “A ritual should feel like coming back to yourself.”
          </blockquote>
          <blockquote className="font-display text-3xl md:mt-28">
            “Quiet, deliberate, beautifully uncomplicated.”
          </blockquote>
          <blockquote className="font-display text-3xl">
            “The pause my mornings were missing.”
          </blockquote>
        </div>
      </section>
      <section className="relative grid min-h-[90vh] place-items-center overflow-hidden">
        <img
          src={editorialImages.hero}
          alt="LEVA skincare campaign"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/40 to-primary/20" />
        <div className="relative z-10 px-6 text-center text-primary-foreground">
          <p className="eyebrow mb-6">Begin with three</p>
          <h2 className="text-7xl font-light md:text-[10rem]">Meet LEVA.</h2>
          <div className="mt-10">
            <Button
              asChild
              className="bg-accent text-accent-foreground hover:bg-primary-foreground"
            >
              <Link to="/shop">
                Shop all <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
