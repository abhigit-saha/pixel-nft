import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const NftCarousel = ({ uris }: { uris: string[] }) => {
  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Blue bar spanning the top of the whole carousel */}

      <Carousel className="w-full">
        <CarouselContent className="-ml-4">
          {uris.map((uri, index) => (
            <CarouselItem key={index} className="pl-4 basis-1/4">
              <Card className="w-full">
                <CardContent className="flex flex-col items-center justify-center p-4">
                  <div className="relative w-full aspect-square mb-4">
                    <Image
                      src={uri}
                      alt={`NFT ${index + 1}`}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-md"
                    />
                  </div>
                  <Button className="w-full">Mint</Button>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default NftCarousel;
