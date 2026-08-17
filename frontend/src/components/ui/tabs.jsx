import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../lib/utils";

const Tabs = React.forwardRef(({ selectedKey, onSelectionChange, value, onValueChange, className, children, ...props }, ref) => {
  const actualValue = value || selectedKey;
  const actualOnChange = onValueChange || onSelectionChange;
  
  return (
    <TabsPrimitive.Root
      ref={ref}
      value={actualValue}
      onValueChange={actualOnChange}
      className={cn("flex flex-col", className)}
      {...props}
    >
      {children}
    </TabsPrimitive.Root>
  );
});
Tabs.displayName = TabsPrimitive.Root.displayName;

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-xl bg-surface/60 p-1 text-muted",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef(({ className, id, value, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    value={value || id}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1 text-xs font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef(({ className, id, value, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    value={value || id}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

Tabs.ListContainer = ({ children }) => <div>{children}</div>;
Tabs.List = TabsList;
Tabs.Tab = TabsTrigger;
Tabs.Panel = TabsContent;

export { Tabs, TabsList, TabsTrigger, TabsContent };
