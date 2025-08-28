"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function CreatePollPage() {
  const [options, setOptions] = useState(["Option 1", "Option 2"]);

  const addOption = () => {
    setOptions([...options, `Option ${options.length + 1}`]);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Create New Poll</h1>
          <Button variant="outline" asChild>
            <Link href="/polls">Cancel</Link>
          </Button>
        </div>
        <Tabs defaultValue="basic">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Poll Information</CardTitle>
                <CardDescription>
                  Enter the details for your new poll
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Poll Title</Label>
                  <Input id="title" placeholder="Enter a question or title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    placeholder="Provide more context about your poll"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Poll Options</Label>
                  {options.map((option, index) => (
                    <Input key={index} placeholder={option} />
                  ))}
                </div>
                <Button variant="outline" onClick={addOption}>
                  Add Option
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Poll Settings</CardTitle>
                <CardDescription>
                  Configure additional options for your poll
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="multiple-options" />
                  <Label htmlFor="multiple-options">
                    Allow users to select multiple options
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="require-login" defaultChecked />
                  <Label htmlFor="require-login">
                    Require users to be logged in to vote
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">Poll End Date (Optional)</Label>
                  <Input id="end-date" placeholder="dd/mm/yyyy, --:-- --" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <div className="mt-6 flex justify-end">
          <Button>Create Poll</Button>
        </div>
      </div>
      <footer className="text-center text-sm text-muted-foreground mt-8">
        © 2025 ALX Polly. All rights reserved.
      </footer>
    </div>
  );
}
