import type { SVGProps } from 'react';

export function BrandLogo(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path d="M17.61,3.43a10,10,0,1,0,0,17.14" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            <path d="M12.33 8.35a3.92 3.92 0 0 0-4.22 4.22m4.22-4.22a3.92 3.92 0 0 1-4.22 4.22" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            <path d="M12.33,8.35,10.67,6.68h0a1.67,1.67,0,0,1,2.36,0h0a1.67,1.67,0,0,1,0,2.36Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            <path d="M8.11 12.57 6.45 14.23h0a1.67 1.67 0 0 1-2.36,0h0a1.67 1.67 0 0 1,0-2.36Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
        </svg>
    )
}
