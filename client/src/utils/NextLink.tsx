import Link from 'next/link';
import React, { ReactNode } from 'react';

type NextLinkProps = {
  href: string;
  children: ReactNode;
  color?: string;
}

const NextLink: React.FC<NextLinkProps> = ({ href, children, color='black' }) => {
  return (
    <Link href={href} style={{color:color,textDecoration:'none'}}>
      {children}
    </Link>
  );
};

export default NextLink;
