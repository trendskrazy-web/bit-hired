'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase";
import { ShieldAlert } from "lucide-react";

export default function AdminMakerPage() {
    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    
    // This is the designated "super admin" UID.
    const SUPER_ADMIN_UID = 'GEGZNzOWg6bnU53iwJLzL5LaXwR2';

    const makeAdmin = () => {
        // In a real app, this would be a secure backend call.
        // For development, we'll use localStorage.
        localStorage.setItem('isAdmin', 'true');
        toast({
            title: "Admin Granted!",
            description: "You have been granted admin privileges. Please refresh the page.",
        });
        // Force a reload to update the user state
        window.location.reload();
    };

    const removeAdmin = () => {
        localStorage.removeItem('isAdmin');
        toast({
            title: "Admin Revoked",
            description: "Admin privileges have been revoked. Please refresh the page.",
        });
        window.location.reload();
    }

    if (isUserLoading) {
        return (
             <div className="flex justify-center items-center h-full">
                <p>Loading...</p>
            </div>
        )
    }

    if (user?.uid !== SUPER_ADMIN_UID) {
        return (
             <div className="flex justify-center items-center h-full">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                            <ShieldAlert className="w-6 h-6 text-destructive" />
                            Access Denied
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>You do not have permission to access this page.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }


    return (
        <div className="flex justify-center items-center h-full">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Admin Access Control (Dev Only)</CardTitle>
                    <CardDescription>
                        Use these buttons to grant or revoke admin privileges for your current user session.
                        You will need to refresh the page for the changes to take effect.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center gap-4">
                    <Button onClick={makeAdmin}>Make Me Admin</Button>
                    <Button onClick={removeAdmin} variant="destructive">Remove Admin</Button>
                </CardContent>
            </Card>
        </div>
    );
}
