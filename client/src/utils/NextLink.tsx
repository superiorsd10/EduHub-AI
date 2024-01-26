import Link from 'next/link';
import React, { ReactNode } from 'react';

type NextLinkProps = {
  href: string;
  children: ReactNode;
}

const NextLink: React.FC<NextLinkProps> = ({ href, children }) => {
  return (
    <Link href={href} style={{color:'black',textDecoration:'none'}}>
      {children}
    </Link>
  );
};

export default NextLink;
