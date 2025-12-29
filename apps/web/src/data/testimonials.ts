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
];