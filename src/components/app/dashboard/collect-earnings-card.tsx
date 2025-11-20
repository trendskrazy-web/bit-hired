'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Wallet } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface CollectEarningsCardProps {
    totalDailyEarnings: number;
    onCollect: () => void;
    lastCollectedAt?: string;
    isLoading?: boolean;
}

export function CollectEarningsCard({ totalDailyEarnings, onCollect, lastCollectedAt, isLoading }: CollectEarningsCardProps) {
    const { toast } = useToast();
    const [isCollecting, setIsCollecting] = useState(false);
    const [displayEarnings, setDisplayEarnings] = useState(0);

    const canCollectToday = useMemo(() => {
        if (!lastCollectedAt) return true; // Can collect if they never have before
        const today = new Date().toISOString().split('T')[0];
        return lastCollectedAt < today;
    }, [lastCollectedAt]);

    useEffect(() => {
        if (canCollectToday) {
            setDisplayEarnings(totalDailyEarnings);
        } else {
            setDisplayEarnings(0);
        }
    }, [totalDailyEarnings, canCollectToday]);

    const handleCollect = () => {
        if (displayEarnings <= 0) {
             toast({
                title: 'No Earnings to Collect',
                description: `You have no active machines generating earnings, or you've already collected today.`,
                variant: 'destructive'
            });
            return;
        }
        setIsCollecting(true);
        onCollect();
        
        // Simulate network delay
        setTimeout(() => {
            setIsCollecting(false);
            toast({
                title: 'Earnings Collected!',
                description: `KES ${displayEarnings.toFixed(2)} has been added to your balance.`
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
                    {isLoading ? (
                        <Skeleton className="h-10 w-48 mx-auto mt-1" />
                    ) : (
                        <p className="text-4xl font-bold text-primary">
                            KES {displayEarnings.toFixed(2)}
                        </p>
                    )}
                    {!canCollectToday && !isLoading && (
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
                    disabled={!canCollectToday || isCollecting || isLoading}
                >
                    {isCollecting ? 'Collecting...' : 'Collect All Earnings'}
                </Button>
            </CardFooter>
        </Card>
    )
}
