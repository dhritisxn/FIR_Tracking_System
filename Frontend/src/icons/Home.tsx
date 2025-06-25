import React from 'react';
import IconBase from './IconBase';

const Home = (props: React.SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </IconBase>
);

export default Home;
