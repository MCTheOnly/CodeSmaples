// ######
// SAMPLE 1 - MAIN APP
// ######

import React from "react"
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { FiSettings } from 'react-icons/fi'

import { Navbar, Sidebar } from './components'
import { Ecommerce, Orders, Code3D } from './pages'

import { useStateContext } from './contexts/ContextProvider'

import './App.css'

const App = () => {

	const { activeMenu } = useStateContext()

	return (
		<div className="App">
			<BrowserRouter>
				<div className="main__wrapper">

					<div className="navbar__wrapper">
						<div className="navbar__content">
							<Navbar />
						</div>
					</div>

					<div className="tooltip content">
						<button type="button" className="tooltip button">
							<FiSettings />
						</button>
					</div>

					{activeMenu ? (
						<div className="sidebar">
							<Sidebar />
						</div>
					) : (
						<div className="sidebar hidden">
							<Sidebar />
						</div>
					)}

					<div className="page__wrapper">
						<Routes>
							<Route path="/" element={<Ecommerce />} />
							<Route path="/ecommerce" element={<Ecommerce />} />
							<Route path="/Code3D" element={<Code3D />} />

							<Route path="/orders" element={<Orders />} />
						</Routes>
					</div>


				</div>
			</BrowserRouter>
		</div>
	)
}

export default App

// ######
// SAMPLE 2 - CONTEXT PROVIDER
// ######

import React, { createContext, useContext, useState } from "react"

const StateContext = createContext({})

const initialState = {
	chat: false,
	cart: false,
	userProfile: false,
	notification: false
}

const currentCamPos = {
	x: 0,
	z: 0
}

export const ContextProvider = ({ children }) => {

	const [activeMenu, setActiveMenu] = useState(true)

	const [isClicked, setIsClicked] = useState(initialState)

	const [screenSize, setScreenSize] = useState(undefined)

	const handleClick = (clicked) => {
		setIsClicked({ ...initialState, [clicked]: true })
	}

	const [cameraPosition, setCameraPosition] = useState(currentCamPos)

	const handleCamPos = (axis, position) => {
		setCameraPosition({ ...currentCamPos, [axis]: position })
	}

	return (
		<StateContext.Provider value={{
			activeMenu,
			setActiveMenu,
			isClicked,
			setIsClicked,
			handleClick,
			screenSize,
			setScreenSize,
			cameraPosition,
			setCameraPosition,
			handleCamPos
		}}>
			{children}
		</StateContext.Provider>
	)
}

export const useStateContext = () => useContext(StateContext)

// ######
// SAMPLE 3 - ROUTING
// ######

import React from "react"
import { Link, NavLink } from "react-router-dom";
import { SiShopware } from 'react-icons/si'
import { MdOutlineCancel } from 'react-icons/md'
import { links } from '../data/dummy'
import { useStateContext } from '../contexts/ContextProvider'

const Sidebar = () => {

	const { activeMenu, setActiveMenu, screenSize } = useStateContext()
	const activeLink = 'true'
	const normalLink = 'true'

	const handleCloseSideBar = () => {
		if (activeMenu && screenSize <= 900) {
			setActiveMenu(false)
		}
	}

	return (
		<div className="sidebar__wrapper">
			{activeMenu && (
				<>
					<div className="sidebar__header">
						<Link to="/" onClick={handleCloseSideBar}>
							<SiShopware /> Shop
						</Link>

						<button type="button" onClick={() => setActiveMenu((prevActiveMenu) => !prevActiveMenu)}>
							<MdOutlineCancel />
						</button>
					</div>

					<div className="sidebar__links">
						{links && links.map((item) => (
							<div key={item.title} className="sidebar__links--wrapper">
								<p>{item.title}</p>
								{item.links.map((link) => (
									<NavLink
										to={`/${link.name}`}
										key={link.name}
										onClick={handleCloseSideBar}
										className={({ isActive }) => isActive ? activeLink : normalLink}>
										{link.icon}
										<span>{link.name}</span>
									</NavLink>
								))}
							</div>
						))}
					</div>
				</>
			)}
		</div>
	);
}

export default Sidebar;
