render() {
	const images = this.state.urls.map((url, i) => (
		<li key={i}><img className="info-pics" src={url} /></li>
	));
	return (
		<div className="info-container">
			<ul className="info-pic-list">{images}</ul>
		</div>
	);
}