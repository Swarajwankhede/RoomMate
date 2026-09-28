import {useEffect,useState} from 'react';
import {useCampus} from '../context.jsx';
export default function Home(){const {events}=useCampus();
const [time,setTime]=useState(new Date());
const [post,setPost]=useState('Loading live campus feed...');
useEffect(()=>{const i=setInterval(()=>setTime(new Date()),1000);
	fetch('https://jsonplaceholder.typicode.com/posts/1')
	.then(r=>r.json()).then(x=>setPost(x.title))
	.catch(()=>setPost('Campus feed unavailable'));
	return()=>clearInterval(i)},[]);
return <main className="container">
	<h1>CampusConnect</h1>
	<div className="grid">
		<div className="card">
			<span className="pill">Live Campus Clock</span>
			<div className="big">{time.toLocaleTimeString()}</div>
			<p>{time.toLocaleDateString()}</p></div>
			<div className="card"><span className="pill">Events</span>
				<div className="big">{events.length}</div>
				<p>Saved campus events</p></div></div>
				<div className="card" style={{marginTop:18}}>
					<h3>Live API Campus Feed</h3><p>{post}</p>
				</div>
	</main>}