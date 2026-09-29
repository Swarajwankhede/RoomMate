import React from 'react';
import { Link } from 'react-router-dom';

function PageNotFound() {
  return (
  	<>
		{/* Visual 404 Badge */}

		<h2>404</h2>

		{/* Heading */}

		<h1>Page Not Found</h1>
		{/* Subtext */}

		<h4>Sorry, the page or URL you are looking for doesn't exist or has been moved.</h4>

		{/* Navigation Button */}

		<h4>Go Back Home</h4>
	</>
);
}

export default PageNotFound;