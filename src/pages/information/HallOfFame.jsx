import React, { useState, useEffect } from "react";
import PageHelmet from "../../component/common/Helmet";
import HeaderTwo from "../../component/header/HeaderTwo";
import FooterTwo from "../../component/footer/FooterTwo";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import { useHttpClient } from "../../hooks/common/http-hook";
import Loader from "../../elements/ui/loading/Loader";
import { Dialog } from "primereact/dialog";
import Tree from "../../component/userTree/Tree";

// Sample data structure (replace with actual API data in production)
const sampleUsers = [
	{
		id: 1,
		name: "John Doe",
		avatar: "/assets/images/avatars/bg_other_avatar_1.jpeg",
		tier: "platinum",
		quote: "Proud to support this amazing community that has given me so much!",
		joinDate: "2020-01-15",
	},
	{
		id: 2,
		name: "Jane Smith",
		avatar: "/assets/images/avatars/bg_other_avatar_2.jpeg",
		tier: "gold",
		quote: "Being part of this alumni network has opened countless doors.",
		joinDate: "2020-03-22",
	},
	{
		id: 3,
		name: "Michael Johnsonderson",
		avatar: "/assets/images/team/1.jpg",
		tier: "gold",
		quote: "The connections I've made here are priceless.",
		joinDate: "2020-05-10",
	},
	{
		id: 4,
		name: "Emily Williams",
		avatar: "/assets/images/team/2.jpg",
		tier: "gold",
		quote: "So grateful for this wonderful community.",
		joinDate: "2021-01-05",
	},
	{
		id: 5,
		name: "Robert Brown",
		avatar: "/assets/images/team/3.jpg",
		tier: "silver",
		quote: "Proud member since day one!",
		joinDate: "2021-02-18",
	},
	{
		id: 6,
		name: "Sarah Davis",
		avatar: "/assets/images/team/1.jpg",
		tier: "silver",
		quote: "Being part of this alumni network has opened countless doors.",
		joinDate: "2021-07-30",
	},
	{
		id: 7,
		name: "Thomas Wilson",
		avatar: "/assets/images/team/2.jpg",
		tier: "silver",
		quote: "Being part of this alumni network has opened countless doors.",
		joinDate: "2021-09-12",
	},
	{
		id: 8,
		name: "Lisa Anderson",
		avatar: "/assets/images/team/3.jpg",
		tier: "silver",
		quote: "Being part of this alumni network has opened countless doors.",
		joinDate: "2021-10-05",
	},
	{
		id: 9,
		name: "David Martinez",
		avatar: "/assets/images/team/1.jpg",
		tier: "silver",
		joinDate: "2022-01-20",
	},
	{
		id: 10,
		name: "Jennifer Taylor",
		avatar: "/assets/images/team/2.jpg",
		tier: "bronze",
		joinDate: "2022-03-15",
	},
	{
		id: 11,
		name: "Chris Evans",
		avatar: "/assets/images/team/3.jpg",
		tier: "bronze",
		quote: "Always inspired by this amazing network.",
		joinDate: "2022-04-22",
	},
	{
		id: 12,
		name: "Sophia White",
		avatar: "/assets/images/team/1.jpg",
		tier: "bronze",
		quote: "Such a supportive and motivating community.",
		joinDate: "2022-05-18",
	},
	{
		id: 13,
		name: "Daniel Thomas",
		avatar: "/assets/images/team/2.jpg",
		tier: "bronze",
		quote: "Grateful to be part of this alumni family.",
		joinDate: "2022-06-11",
	},
	{
		id: 14,
		name: "Olivia Harris",
		avatar: "/assets/images/team/3.jpg",
		tier: "bronze",
		quote: "Every event brings new opportunities.",
		joinDate: "2022-07-03",
	},
	{
		id: 15,
		name: "James Lee",
		avatar: "/assets/images/team/1.jpg",
		tier: "bronze",
		quote: "This network has been a game-changer for me.",
		joinDate: "2022-08-19",
	},
	{
		id: 16,
		name: "Mia Clark",
		avatar: "/assets/images/team/2.jpg",
		tier: "standard",
		quote: "The friendships I’ve built here are amazing.",
		joinDate: "2022-09-25",
	},
	{
		id: 17,
		name: "Ethan Lewis",
		avatar: "/assets/images/team/3.jpg",
		tier: "standard",
		quote: "Networking here has been so rewarding.",
		joinDate: "2022-11-07",
	},
	{
		id: 18,
		name: "Ava Walker",
		avatar: "/assets/images/team/1.jpg",
		tier: "standard",
		quote: "Always proud to be part of this group.",
		joinDate: "2023-01-16",
	},
	{
		id: 19,
		name: "Benjamin Hall",
		avatar: "/assets/images/team/2.jpg",
		tier: "standard",
		quote: "Looking forward to many more years here.",
		joinDate: "2023-03-09",
	},
	{
		id: 20,
		name: "Charlotte Young",
		avatar: "/assets/images/team/3.jpg",
		tier: "standard",
		quote: "This community keeps getting better.",
		joinDate: "2023-05-21",
	},
  	{
		id: 21,
		name: "Benjamin Hall",
		avatar: "/assets/images/team/2.jpg",
		tier: "standard",
		quote: "Looking forward to many more years here.",
		joinDate: "2023-03-09",
	},
	{
		id: 22,
		name: "Charlotte Young",
		avatar: "/assets/images/team/3.jpg",
		tier: "standard",
		quote: "This community keeps getting better.",
		joinDate: "2023-05-21",
	},
  	{
		id: 23,
		name: "Benjamin Hall",
		avatar: "/assets/images/team/2.jpg",
		tier: "standard",
		quote: "Looking forward to many more years here.",
		joinDate: "2023-03-09",
	},
	{
		id: 24,
		name: "Charlotte Young",
		avatar: "/assets/images/team/3.jpg",
		tier: "standard",
		quote: "This community keeps getting better.",
		joinDate: "2023-05-21",
	},
];


const HallOfFame = () => {
	const { loading } = useHttpClient(); // sendRequest will be used when API integration is implemented
	const [users, setUsers] = useState([]);
	const [selectedUser, setSelectedUser] = useState(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		// Replace with actual API call to fetch users
		// const fetchUsers = async () => {
		//   try {
		//     const response = await sendRequest("hall-of-fame/users", "GET");
		//     setUsers(response.users);
		//   } catch (err) {
		//     console.error("Error fetching hall of fame users:", err);
		//   }
		// };
		// fetchUsers();

		// Using sample data for now
		setUsers(sampleUsers);
	}, []);

	const handleUserClick = (user) => {
		if (user.quote) {
			setSelectedUser(user);
			setVisible(true);
		}
	};

	return (
		<React.Fragment>
			<PageHelmet pageTitle="Hall of Fame" />
			<HeaderTwo
				headertransparent="header--transparent"
				colorblack="color--black"
				logoname="logo.png"
			/>

			{/* Start Breadcrump Area */}
			<div
				className="rn-page-title-area pt--120 pb--190 bg_image bg_image--15"
				data-black-overlay="6"
			>
				<div className="container">
					<div className="row">
						<div className="col-lg-12">
							<div className="rn-page-title text-center pt--100">
								<h2 className="title theme-gradient">Hall of Fame</h2>
								<p>
									Our esteemed alumni members who make our society exceptional
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
			{/* End Breadcrump Area */}

			{/* Start Hall of Fame Area */}
			<div className="rn-alumni-area mt--100 rn-section-gap">
				<div className="container">
					<div className="row">
						<div className="col-lg-12">
							<div className="section-title text-center mb--30">
								<h3 className="title">Alumni Tree</h3>
								<p className="description">
									Our alumni members are arranged by their membership tier.
									<br />
									Click on premium members to read their inspiring quotes.
								</p>
							</div>
						</div>
					</div>

					{loading ? (
						<Loader />
					) : (
						// <div className="hall-of-fame-tree">
						<div className="user-tree-section">
							<Tree
								users={users}
								onUserClick={handleUserClick}
							/>
						</div>
					)}
				</div>
			</div>
			{/* End Hall of Fame Area */}

			{/* Quote Dialog */}
			<Dialog
				header={selectedUser?.name}
				visible={visible}
				style={{ width: "50vw" }}
				onHide={() => setVisible(false)}
				breakpoints={{ "960px": "75vw", "641px": "90vw" }}
			>
				{selectedUser && (
					<div className="quote-dialog">
						<div className="d-flex align-items-center mb--20">
							<div
								style={{
									width: "80px",
									height: "80px",
									overflow: "hidden",
									borderRadius: "50%",
									marginRight: "20px",
								}}
							>
								<img
									src={selectedUser.avatar}
									alt={selectedUser.name}
									style={{ width: "100%", height: "100%", objectFit: "cover" }}
								/>
							</div>
							<div>
								<h4>{selectedUser.name}</h4>
								<p style={{ margin: 0 }}>
									{selectedUser.tier.charAt(0).toUpperCase() +
										selectedUser.tier.slice(1)}{" "}
									Member
								</p>
							</div>
						</div>

						<div
							className="quote-container p--30 mb--20"
							style={{
								background: "#f9f9f9",
								borderLeft: `4px solid ${
									selectedUser.tier === "platinum" ? "#e5e4e2" : "#FFD700"
								}`,
								borderRadius: "4px",
							}}
						>
							<blockquote className="mb-0">
								&ldquo;{selectedUser.quote}&rdquo;
							</blockquote>
						</div>

						<p className="text-right">
							{`Member since ${new Date(
								selectedUser.joinDate
							).toLocaleDateString()}`}
						</p>
					</div>
				)}
			</Dialog>

			<FooterTwo />

			<div className="backto-top">
				<ScrollToTop showUnder={160}>
					<FiChevronUp />
				</ScrollToTop>
			</div>
		</React.Fragment>
	);
};

export default HallOfFame;
