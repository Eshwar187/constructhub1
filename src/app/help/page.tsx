"use client"

import Link from "next/link"
import { Construction, ArrowLeft, HelpCircle, MessageSquare, Book, FileText, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <header className="container mx-auto py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Construction className="h-8 w-8 text-amber-400" />
          <h1 className="text-2xl font-bold">BuildWise AI</h1>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" className="text-white border-white hover:bg-slate-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </header>

      <main className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <HelpCircle className="h-16 w-16 text-amber-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-2">Help & Support</h1>
            <p className="text-xl text-slate-300">Get assistance with BuildWise AI platform</p>
          </div>

          <Tabs defaultValue="faq" className="space-y-8">
            <TabsList className="bg-slate-800/50 border border-slate-700 p-1 mx-auto flex justify-center">
              <TabsTrigger value="faq" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                <Book className="mr-2 h-4 w-4" />
                FAQ
              </TabsTrigger>
              <TabsTrigger value="guides" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                <FileText className="mr-2 h-4 w-4" />
                User Guides
              </TabsTrigger>
              <TabsTrigger value="contact" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Us
              </TabsTrigger>
            </TabsList>

            <TabsContent value="faq">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription className="text-slate-400">
                    Find answers to common questions about BuildWise AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-2">
                    <AccordionItem value="item-1" className="border-slate-700">
                      <AccordionTrigger className="text-left">What is BuildWise AI?</AccordionTrigger>
                      <AccordionContent className="text-slate-300">
                        BuildWise AI is an AI-powered construction planning platform that helps you create customized
                        floor plans, optimize material usage, and connect with local designers based on your budget and
                        requirements. Our platform uses advanced AI to provide personalized recommendations for your
                        construction projects.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-slate-700">
                      <AccordionTrigger className="text-left">How accurate are the floor plans?</AccordionTrigger>
                      <AccordionContent className="text-slate-300">
                        Our AI-generated floor plans are designed to be practical and efficient based on your inputs.
                        While they provide a solid starting point, we recommend consulting with a professional architect
                        or designer for final construction plans. The floor plans are approximately 85-90% accurate for
                        initial planning purposes.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-slate-700">
                      <AccordionTrigger className="text-left">Are the material prices up-to-date?</AccordionTrigger>
                      <AccordionContent className="text-slate-300">
                        Yes, our material prices are updated in real-time based on current market rates in your
                        location. We source this information from local suppliers and industry databases to ensure you
                        have the most accurate pricing information for your construction project.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4" className="border-slate-700">
                      <AccordionTrigger className="text-left">How do I connect with designers?</AccordionTrigger>
                      <AccordionContent className="text-slate-300">
                        You can browse and connect with local designers directly through our platform. Simply navigate
                        to the "Designers" section in your project dashboard, view designer profiles, and click the
                        "Connect" button to initiate contact. We'll notify the designer about your project, and they'll
                        reach out to you to discuss further details.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-5" className="border-slate-700">
                      <AccordionTrigger className="text-left">Is my data secure?</AccordionTrigger>
                      <AccordionContent className="text-slate-300">
                        Yes, we take data security very seriously. All your project information and personal data are
                        encrypted and stored securely. We do not share your information with third parties without your
                        explicit consent. Our platform complies with industry-standard security protocols to ensure your
                        data remains protected.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="guides">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle>User Guides</CardTitle>
                  <CardDescription className="text-slate-400">
                    Learn how to use BuildWise AI effectively
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Getting Started</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-slate-300">
                          <li className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                              1
                            </div>
                            <span>Create an account and verify your email</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                              2
                            </div>
                            <span>Create your first construction project</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                              3
                            </div>
                            <span>Generate AI floor plans based on your requirements</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                              4
                            </div>
                            <span>Explore material recommendations and local designers</span>
                          </li>
                        </ul>
                        <Button variant="link" className="text-amber-400 p-0 h-auto mt-4">
                          Read full guide
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Using the AI Assistant</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-300 mb-4">
                          Our AI assistant can help you with floor plans, material selection, budget optimization, and
                          more. Learn how to get the most out of this powerful tool.
                        </p>
                        <Button variant="link" className="text-amber-400 p-0 h-auto">
                          Read full guide
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Material Selection Guide</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-300 mb-4">
                          Learn how to use our real-time material pricing and availability features to optimize your
                          construction budget and make informed decisions.
                        </p>
                        <Button variant="link" className="text-amber-400 p-0 h-auto">
                          Read full guide
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Working with Designers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-300 mb-4">
                          This guide explains how to find, evaluate, and collaborate with local designers and
                          contractors through the BuildWise AI platform.
                        </p>
                        <Button variant="link" className="text-amber-400 p-0 h-auto">
                          Read full guide
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                  <CardDescription className="text-slate-400">
                    Get in touch with our support team for assistance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Contact Information</h3>
                        <div className="space-y-3 text-slate-300">
                          <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-amber-400" />
                            <span>support@buildwise.ai</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-amber-400" />
                            <span>+91 123 456 7890</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-2">Support Hours</h3>
                        <p className="text-slate-300">
                          Monday to Friday: 9:00 AM - 6:00 PM IST
                          <br />
                          Saturday: 10:00 AM - 2:00 PM IST
                          <br />
                          Sunday: Closed
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-2">Response Time</h3>
                        <p className="text-slate-300">
                          We typically respond to all inquiries within 24 hours during business days.
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Send us a message</h3>
                      <form className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">
                              Name
                            </label>
                            <Input
                              id="name"
                              placeholder="Your name"
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                              Email
                            </label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="Your email"
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="subject" className="text-sm font-medium">
                              Subject
                            </label>
                            <Input
                              id="subject"
                              placeholder="How can we help?"
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="message" className="text-sm font-medium">
                              Message
                            </label>
                            <Textarea
                              id="message"
                              placeholder="Describe your issue in detail"
                              className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
                            />
                          </div>
                        </div>
                        <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black">Send Message</Button>
                      </form>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 py-8 mt-20">
        <div className="container mx-auto text-center text-slate-400">
          <p>© 2025 BuildWise AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

