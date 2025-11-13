import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-headline font-bold">About BitHired</h1>
        <p className="text-muted-foreground">
          Learn more about our mission and vision.
        </p>
      </div>
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle>Our Mission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Welcome to BitHired, your premier platform for virtual Bitcoin (BTC) mining machine rentals. Our mission is to make cryptocurrency mining accessible and profitable for everyone, regardless of their technical expertise or initial investment. We provide a seamless and secure way to hire virtual mining machines, allowing you to earn BTC without the hassle of purchasing and maintaining expensive hardware.
          </p>
          <p>
            At BitHired, we believe in the power of decentralization and financial empowerment. Our platform is designed to be user-friendly, transparent, and reliable. We offer a range of virtual mining machines to suit different budgets and goals, each with clear performance metrics and earning potential.
          </p>
          <p>
            Join our growing community of virtual miners and start your journey towards financial freedom today. With BitHired, the future of mining is just a few clicks away.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
