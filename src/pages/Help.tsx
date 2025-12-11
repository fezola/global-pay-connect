import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail, ExternalLink } from "lucide-react";

const faqs = [
  {
    question: "How do I use the sandbox environment?",
    answer:
      "The sandbox environment allows you to test integrations without processing real transactions. Use the 'Receive Test USDC' button on the dashboard to simulate incoming payments. All sandbox transactions are mocked and will settle within seconds.",
  },
  {
    question: "How do I switch to devnet?",
    answer:
      "Go to Settings and toggle the 'Use Mock Backend' switch off. This will connect your dashboard to the Solana devnet for more realistic testing. Make sure to update your SDK configuration to point to the devnet environment.",
  },
  {
    question: "Where can I find the program ID?",
    answer:
      "The program ID for our Solana smart contracts can be found in the Developer section. For sandbox testing, you don't need the program ID as transactions are mocked. For devnet, the program ID will be provided in your dashboard.",
  },
  {
    question: "How do webhook signatures work?",
    answer:
      "All webhook payloads are signed using HMAC-SHA256. Your webhook secret is available in Settings. Use our SDK's verifyWebhook function to validate incoming webhooks. Never process webhook events without verifying the signature.",
  },
  {
    question: "What currencies are supported?",
    answer:
      "Currently, we support USDC and USDT on Solana. More currencies and chains will be added in future releases. All sandbox transactions use test tokens with no real value.",
  },
  {
    question: "How long do payouts take?",
    answer:
      "On-chain payouts are typically instant (1-2 block confirmations). Bank payouts via off-ramps take 1-3 business days depending on your bank and location. In sandbox mode, all payouts settle within seconds.",
  },
];

export default function Help() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Help & Support</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Frequently asked questions and support resources
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FAQs */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="font-semibold mb-4">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-6">
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-semibold mb-4">Get in Touch</h3>
            <div className="space-y-3">
              <a
                href="#"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Discord Community</p>
                  <p className="text-xs text-muted-foreground">Join our developer community</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />
              </a>
              <a
                href="#"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Email Support</p>
                  <p className="text-xs text-muted-foreground">support@klyr.io</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />
              </a>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-semibold mb-2">Documentation</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Explore our comprehensive guides and API reference.
            </p>
            <Button variant="outline" className="w-full gap-2">
              <ExternalLink className="h-4 w-4" />
              View Documentation
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
