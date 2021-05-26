/*
 * Author:  simshadows <contact@simshadows.com>
 * License: GNU Affero General Public License v3 (AGPL-3.0)
 *
 * Requires React and ReactDOM to be imported in HTML.
 */

import * as check from "./check.js";
import {
    isArmourSlotStr,
    isDecoEquippableSlotStr,
    br,
} from "./common.js";

import Modal from "./component_groups/modal.js";

import SkillsResultsBox from "./component_groups/main_view/skill_results_box.js";
import EquipmentSelectionsBox from "./component_groups/main_view/equipment_selections_box.js";
import CalculationResultsBox from "./component_groups/main_view/calculation_results_box.js";
import UtilBox from "./component_groups/main_view/util_box.js";

const element = React.createElement;
const assert = console.assert;

function Footer(props) {
    return element("footer",
        {
        id: "footer",
        },
        element("p",
            null,
            element("b", null, "This project is currently in very early development."),
            " Full source code available ",
            element("a",
                {
                href: "https://github.com/simshadows/monster-hunter-rise-builder",
                target: "_blank",
                },
                "here"
            ),
            "."
        )
    );
}

class MainView extends React.Component {

    render() {
        check.isFunction(this.props.handleClickBuffsSelect);
        check.isFunction(this.props.handleClickWeaponSelect);
        check.isFunction(this.props.handleClickWeaponCustomize);
        check.isFunction(this.props.handleClickArmourSelect);
        check.isFunction(this.props.handleClickTalismanSelect);
        check.isFunction(this.props.handleClickPetalaceSelect);
        check.isFunction(this.props.handleClickPetalaceSelect);

        return element("div",
            {
            className: "body-outer-box",
            },
            element("div",
                {
                id: "app-inner-box",
                className: "body-inner-box",
                },
                element(UtilBox,
                    null,
                    null,
                ),
                element("div",
                    {
                    className: "app-view-box",
                    id: "mhr-builder-app-main-view",
                    },
                    element("div",
                        {
                        className: "main-view-inner-box",
                        },
                        element(SkillsResultsBox,
                            null,
                            null,
                        ),
                        element(EquipmentSelectionsBox,
                            {
                            handleClickBuffsSelect:     ()       => {this.props.handleClickBuffsSelect();},
                            handleClickWeaponSelect:    ()       => {this.props.handleClickWeaponSelect();},
                            handleClickWeaponCustomize: ()       => {this.props.handleClickWeaponCustomize();},
                            handleClickArmourSelect:    (slotID) => {this.props.handleClickArmourSelect(slotID);},
                            handleClickTalismanSelect:  ()       => {this.props.handleClickTalismanSelect();},
                            handleClickPetalaceSelect:  ()       => {this.props.handleClickPetalaceSelect();},
                            handleClickDecorationSelect: (slotID, decoSlotID) => {this.props.handleClickDecorationSelect(slotID, decoSlotID)},
                            },
                            null,
                        ),
                        element(CalculationResultsBox,
                            null,
                            null,
                        ),
                    ),
                ),
            ),
            element(Footer,
                null,
                null,
            ),
        );

    }
}

class BuffsSelectView extends React.Component {
    render() {
        return element("div",
            {
            className: "app-view-box",
            id: "mhr-builder-app-buffs-select-view",
            },
            "This is the buffs/states select view! It's not implemented yet.",
        );
    }
}

class WeaponSelectView extends React.Component {
    render() {
        return element("div",
            {
            className: "app-view-box",
            id: "mhr-builder-app-weapon-select-view",
            },
            "This is the weapon select view! It's not implemented yet.",
        );
    }
}

class WeaponCustomizeView extends React.Component {
    render() {
        return element("div",
            {
            className: "app-view-box",
            id: "mhr-builder-app-weapon-customize-view",
            },
            "This is the weapon customize view! It's not implemented yet.",
        );
    }
}

class ArmourSelectView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
                querySlotID: "head",
            };
    }

    reinitialize(slotID) {
        assert(isArmourSlotStr(slotID));
        this.setState({querySlotID: slotID});
    }

    render() {
        return element("div",
            {
            className: "app-view-box",
            id: "mhr-builder-app-armour-select-view",
            },
            "This is the armour select view! It's not implemented yet.",
            br(),
            "Initialized to search for: " + this.state.querySlotID,
        );
    }
}

class TalismanSelectView extends React.Component {
    render() {
        return element("div",
            {
            className: "app-view-box",
            id: "mhr-builder-app-talisman-select-view",
            },
            "This is the talisman select view! It's not implemented yet.",
        );
    }
}

class PetalaceSelectView extends React.Component {
    render() {
        return element("div",
            {
            className: "app-view-box",
            id: "mhr-builder-app-petalace-select-view",
            },
            "This is the petalace select view! It's not implemented yet.",
        );
    }
}

class DecorationSelectView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
                querySlotID: "head",
                queryDecoSlotID: 0,
            };
    }

    reinitialize(slotID, decoSlotID) {
        this.setState({
                querySlotID: slotID,
                queryDecoSlotID: decoSlotID,
            });
    }

    render() {
        assert(isDecoEquippableSlotStr(this.state.querySlotID));
        check.isInt(this.state.queryDecoSlotID);
        assert((this.state.queryDecoSlotID >= 0) && (this.state.queryDecoSlotID < 3));

        return element("div",
            {
            className: "app-view-box",
            id: "mhr-builder-app-decorations-select-view",
            },
            "This is the decorations select view! It's not implemented yet.",
            br(),
            "Initialized to search for: " + this.state.querySlotID + ", slot " + parseInt(this.state.queryDecoSlotID),
        );
    }
}

class MHRBuilderAppContainer extends React.Component {

    static _viewEnumValues = new Set([
            "main",
            "buffs_select_view",
            "armour_select_view",
            "weapon_select_view",
            "weapon_customize_view",
            "talisman_select_view",
            "petalace_select_view",
            "decoration_select_view",
        ]);

    constructor(props) {
        super(props);
        this.state = {
                view: "main", // Always start with the main view
            };

        this.myRefs = {
                armourSelectView: React.createRef(),
                decoSelectView: React.createRef(),
            };

        // TODO: Ugh, the fact that we don't do this consistently is weird. Change it later?
        this.handleKeypress = this.handleKeypress.bind(this);
    }

    handleKeypress(e) {
        if (e.code === "Escape") {
            if (this.state.view != "main") {
                this.setState({view: "main"});
            }
        }
    }

    handleClickBuffsSelect() {
        assert(this.state.view == "main");
        this.setState({view: "buffs_select_view"});
    }
    handleClickWeaponSelect() {
        assert(this.state.view == "main");
        this.setState({view: "weapon_select_view"});
    }
    handleClickWeaponCustomize() {
        assert(this.state.view == "main");
        this.setState({view: "weapon_customize_view"});
    }
    handleClickArmourSelect(slotID) {
        assert(isArmourSlotStr(slotID));
        assert(this.state.view == "main");
        this.myRefs.armourSelectView.current.reinitialize(slotID);
        this.setState({view: "armour_select_view"});
    }
    handleClickTalismanSelect() {
        assert(this.state.view == "main");
        this.setState({view: "talisman_select_view"});
    }
    handleClickPetalaceSelect() {
        assert(this.state.view == "main");
        this.setState({view: "petalace_select_view"});
    }
    handleClickDecorationSelect(slotID, decoSlotID) {
        assert(isDecoEquippableSlotStr(slotID));
        check.isInt(decoSlotID);
        assert((decoSlotID >= 0) && (decoSlotID < 3));
        assert(this.state.view == "main");
        this.myRefs.decoSelectView.current.reinitialize(slotID, decoSlotID);
        this.setState({view: "decoration_select_view"});
    }

    handleReturnToMainView() {
        assert(this.state.view != "main");
        this.setState({view: "main"});
    }

    /* Inherited Methods */

    componentDidMount() {
        document.addEventListener("keydown", this.handleKeypress);
    }
    componentWillUnmount() {
        // TODO: Verify event removal matching?
        document.removeEventListener("keydown", this.handleKeypress);
    }

    render() {
        assert(this.constructor._viewEnumValues.has(this.state.view));

        const selectionViewIsVisible = {
                buffs:       (this.state.view == "buffs_select_view" ),
                weapon:      (this.state.view == "weapon_select_view"),
                weapon_cust: (this.state.view == "weapon_customize_view"),
                armour:      (this.state.view == "armour_select_view"),
                talisman:    (this.state.view == "talisman_select_view"),
                petalace:    (this.state.view == "petalace_select_view"),
                decos:       (this.state.view == "decoration_select_view"),
            };

        return element("div",
            {
            id: "app",
            className: "stackouter",
            },
            element(MainView,
                {
                handleClickBuffsSelect:      ()       => {this.handleClickBuffsSelect();},
                handleClickWeaponSelect:     ()       => {this.handleClickWeaponSelect();},
                handleClickWeaponCustomize:  ()       => {this.handleClickWeaponCustomize();},
                handleClickArmourSelect:     (slotID) => {this.handleClickArmourSelect(slotID);},
                handleClickTalismanSelect:   ()       => {this.handleClickTalismanSelect();},
                handleClickPetalaceSelect:   ()       => {this.handleClickPetalaceSelect();},
                handleClickDecorationSelect: (slotID, decoSlotID) => {this.handleClickDecorationSelect(slotID, decoSlotID);},
                },
                null,
            ),
            element(Modal,
                {
                visible: selectionViewIsVisible.buffs,
                title: "Select Buffs and States",
                handleCloseModal: () => {this.handleReturnToMainView();},
                },
                element(BuffsSelectView,
                    null,
                    null,
                ),
            ),
            element(Modal,
                {
                visible: selectionViewIsVisible.weapon,
                title: "Select Weapon",
                handleCloseModal: () => {this.handleReturnToMainView();},
                },
                element(WeaponSelectView,
                    null,
                    null,
                ),
            ),
            element(Modal,
                {
                visible: selectionViewIsVisible.weapon_cust,
                title: "Customize Weapon",
                handleCloseModal: () => {this.handleReturnToMainView();},
                },
                element(WeaponCustomizeView,
                    null,
                    null,
                ),
            ),
            element(Modal,
                {
                visible: selectionViewIsVisible.armour,
                title: "Select Armor",
                handleCloseModal: () => {this.handleReturnToMainView();},
                },
                element(ArmourSelectView,
                    {
                    ref: this.myRefs.armourSelectView,
                    },
                    null,
                ),
            ),
            element(Modal,
                {
                visible: selectionViewIsVisible.talisman,
                title: "Set Talisman",
                handleCloseModal: () => {this.handleReturnToMainView();},
                },
                element(TalismanSelectView,
                    null,
                    null,
                ),
            ),
            element(Modal,
                {
                visible: selectionViewIsVisible.petalace,
                title: "Select Petalace",
                handleCloseModal: () => {this.handleReturnToMainView();},
                },
                element(PetalaceSelectView,
                    null,
                    null,
                ),
            ),
            element(Modal,
                {
                visible: selectionViewIsVisible.decos,
                title: "Select Decoration",
                handleCloseModal: () => {this.handleReturnToMainView();},
                },
                element(DecorationSelectView,
                    {
                    ref: this.myRefs.decoSelectView,
                    },
                    null,
                ),
            ),
        );
    }
}

ReactDOM.render(
    element(MHRBuilderAppContainer, null),
    document.getElementById("app-container")
);

