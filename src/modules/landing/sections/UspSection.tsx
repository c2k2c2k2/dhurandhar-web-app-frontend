import { PageContainer } from "@/components/layout/PageContainer";
import { uspItems } from "@/modules/landing/content";

export function UspSection() {
  return (
    <section
      id="about"
      className="scroll-mt-24 bg-[linear-gradient(165deg,rgba(8,49,103,0.03),transparent_46%)] py-14 md:py-18"
    >
      <PageContainer className="max-w-6xl">
        <div className="space-y-4">
          <p className="text-xs font-semibold tracking-[0.16em] text-primary dark:text-brand-gold">
            आम्हालाच का निवडाल?
          </p>
          <h2 className="font-display text-2xl font-semibold md:text-3xl">
            स्पर्धा परीक्षेसाठी स्पष्ट प्रणाली, सुसंगत कंटेंट आणि कृतीयोग्य सराव
          </h2>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
            निकालावर प्रभाव टाकणाऱ्या गोष्टींवरच भर: योग्य कंटेंट, नियमित सराव,
            स्पष्ट दिशा.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {uspItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-3xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 dark:hover:border-brand-gold/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 dark:bg-brand-gold/15">
                  <Icon className="h-5 w-5 text-primary dark:text-brand-gold" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}
