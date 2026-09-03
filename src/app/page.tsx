import { Hero } from "@/components/home/Hero";
import { TodaySnapshot } from "@/components/home/TodaySnapshot";
import { SystemMap } from "@/components/home/SystemMap";
import { DataSourceStatus } from "@/components/home/DataSourceStatus";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <TodaySnapshot />
      <SystemMap />
      <DataSourceStatus />
      <Footer />
    </>
  );
}
