// Image testimonials data
export type ImageTestimonial = {
    id: string;
    type: "image";
    imageUrl: string;
    alt: string;
};

export const imageTestimonials: ImageTestimonial[] = [
    {
        id: "img-1",
        type: "image",
        imageUrl: "https://picsum.photos/id/101/600/400",
        alt: "User tweet about Opensox",
    },
    {
        id: "img-2",
        type: "image",
        imageUrl: "https://picsum.photos/id/103/500/500",
        alt: "Screenshot of dashboard stats",
    },
    {
        id: "img-3",
        type: "image",
        imageUrl: "https://picsum.photos/id/104/600/350",
        alt: "Social media shoutout",
    },
    {
        id: "img-4",
        type: "image",
        imageUrl: "https://picsum.photos/id/106/400/600",
        alt: "Mobile view screenshot",
    },
    {
        id: "img-5",
        type: "image",
        imageUrl: "https://standardcoldpressedoil.com/wp-content/uploads/2023/04/Loyal-Customer-Strongly-Recommends-Standard-Cold-Pressed-Oil.png",
        alt: "Mobile view screenshot",
    },
];