import React from 'react';
import IconBase from './IconBase';

const Fingerprint = (props: React.SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4" />
    <path d="M5 19.5C5.5 18 6 15 6 12c0-1.1.1-2.2.3-3.2" />
    <path d="M17.8 21.2c.2-.5.2-1.2.2-1.8c0-2.8-1.3-5.2-3.2-6.8" />
    <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2" />
    <path d="M9 12c0-1.7 1.3-3 3-3s3 1.3 3 3" />
  </IconBase>
);

export default Fingerprint;
