export type City = {
	code: string;
	name: string;
};

export type ProjectMember = {
	city: City;
	login: string;
	lastname: string;
	firstname: string;
	accepted?: boolean;
	notified?: boolean;
};

export type ProjectTag = {
	id: number;
	label: string;
	label_fr: string;
	color: string;
};

export type Project = {
	scholarYear: number;
	averageMark: number;
	documentUploaded: boolean;
	videoUploaded: boolean;
	logoUploaded: boolean;
	bannerUploaded: boolean;
	id: number;
	name: string;
	description: string;
	owner: string;
	members: ProjectMember[];
	ownerCity: City;
	lookingForMembers: boolean;
	status: string;
	envisagedType: string;
	publicVideo: boolean;
	createdAt: string;
	updatedAt: string;
	tags: ProjectTag[];
	totalViews: number;
	totalStars: number;
	starred: boolean;
};
