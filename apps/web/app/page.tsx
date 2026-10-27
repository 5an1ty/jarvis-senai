'use client';

import {useRouter} from 'next/navigation';
import Landing from '../components/landing';

export default function HomePage(){
 const router=useRouter();
 return <Landing feedback="" onEnter={async()=>{router.push('/app')}}/>;
}
