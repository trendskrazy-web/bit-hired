
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Wallet } from "lucide-react";
import { useMemo, useState } from "react";

interface CollectEarningsCardProps {
    totalDailyEarnings: number;
    onCollect: () => void;
    lastCollectedAt?: string;
}

export function CollectEarningsCard({ totalDailyEarnings, onCollect, lastCollectedAt }: CollectEarningsCardProps) {
    const { toast } = useToast();
    const [isCollecting, setIsCollecting] = useState(false);

    const canCollectToday = useMemo(() => {
        if (!lastCollectedAt) return true; // Can collect if they never have before
        const today = new Date().toISOString().split('T')[0];
        return lastCollectedAt < today;
    }, [lastCollectedAt]);

    const handleCollect = () => {
        setIsCollecting(true);
        onCollect();
        
        // Simulate network delay
        setTimeout(() => {
            setIsCollecting(false);
            toast({
                title: 'Earnings Collected!',
                description: `KES ${totalDailyEarnings.toFixed(2)} has been added to your balance.`
            });
        }, 1000);
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wallet className="w-6 h-6" />
                    Daily Earnings
                </CardTitle>
                <CardDescription>
                    Collect your total earnings from all active machines once per day.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Available to Collect</p>
                    <p className="text-4xl font-bold text-primary">
                        KES {canCollectToday ? totalDailyEarnings.toFixed(2) : '0.00'}
                    </p>
                    {!canCollectToday && (
                         <p className="text-xs text-muted-foreground mt-2">
                            You have already collected your earnings today. Please check back tomorrow.
                        </p>
                    )}
                </div>
            </CardContent>
            <CardFooter>
                <Button 
                    className="w-full"
                    onClick={handleCollect}
                    disabled={!canCollectToday || totalDailyEarnings <= 0 || isCollecting}
                >
                    {isCollecting ? 'Collecting...' : 'Collect All Earnings'}
                </Button>
            </CardFooter>
        </Card>
    )
}
