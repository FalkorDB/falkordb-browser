import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function Page() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-semibold">Login FalkorDB server</CardTitle>
                <CardDescription className="text-gray-500">
                    Fill in the form below to login to your FalkorDB server.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">User Name</Label>
                        <Input id="username" placeholder="Enter username if exits" type="text" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" placeholder="Enter password if exits" type="password" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="server">Server</Label>
                        <Input id="server" placeholder="Enter your email" type="text" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="port">Port</Label>
                        <Input id="port" placeholder="Enter your email" type="number" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="url">URL</Label>
                    <Input id="url" placeholder="Enter connection URL" type="url" />
                </div>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button>Login</Button>
            </CardFooter>
        </Card>
    )
}