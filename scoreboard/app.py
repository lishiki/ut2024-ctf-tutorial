import uuid
import streamlit as st
import mysql.connector
import time
from streamlit_cookies_controller import CookieController
import pandas as pd
import yaml
import os

st.set_page_config(
    page_title="UT MINI CTF 2024",
    page_icon=":material/flag:",
    layout="wide",
    menu_items=None,
)
# st.set_option("client.toolbarMode", "minimal")

controller = CookieController()

with open("ctf.yml") as f:
    challenge_data = f.read()

challenge_data = challenge_data.format(**os.environ)

ctf_yaml = yaml.safe_load(challenge_data)

ctf = ctf_yaml["ctf"]
challenges = ctf_yaml["challenges"]


# MySQL connection setup
def get_db_connection():
    return mysql.connector.connect(
        host="mysql", user="scoreboard", password="scoreboard", database="scoreboard"
    )


@st.cache_data
def authenticate(username, token):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM users WHERE username = %s AND token = %s", (username, token)
    )
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    return user


def set_state():
    username = controller.get("mini_user")
    token = controller.get("mini_token")
    user = authenticate(username, token)
    if user:
        st.session_state.logged_in = True
        st.session_state.user_id = user[0]
        st.session_state.username = username
        st.session_state.token = token
    else:
        st.session_state.logged_in = False


def get_solves(username):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT user_id, challenge_id FROM solves WHERE user_id = %s", (username,)
    )
    solves = cursor.fetchall()
    cursor.close()
    conn.close()
    return solves


def solve(username, challenge_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO solves (user_id, challenge_id) VALUES (%s, %s)",
        (username, challenge_id),
    )
    conn.commit()
    cursor.close()
    conn.close()


@st.cache_data(ttl=60)
def get_scores():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT users.username, COUNT(solves.id) AS solve_count, GROUP_CONCAT(solves.challenge_id ORDER BY solves.challenge_id) AS challenge_ids
        FROM solves
        JOIN users ON solves.user_id = users.id
        GROUP BY solves.user_id
        ORDER BY solve_count DESC, MAX(solves.timestamp) ASC
        """
    )
    scores = cursor.fetchall()
    cursor.close()
    conn.close()
    return scores


@st.cache_data(ttl=60)
def get_users():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT id, username, experienced, offline FROM users
        """
    )
    users = cursor.fetchall()
    cursor.close()
    conn.close()
    return users


# Function to handle user registration
def register():
    st.subheader("Register")
    username = st.text_input("Username", key="register_username")
    experienced = (
        st.selectbox(
            "CTFの経験が少しでもありますか？", ["Yes", "No"], key="register_experience"
        )
        == "Yes"
    )
    offline = (
        st.selectbox("Offlineで参加ですか？", ["Yes", "No"], key="register_offline")
        == "Yes"
    )
    token = uuid.uuid4().hex
    if st.button("Register"):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        if cursor.fetchone():
            st.error("Username already exists")
        else:
            cursor.execute(
                "INSERT INTO users (username, token, experienced, offline) VALUES (%s, %s, %s, %s)",
                (username, token, experienced, offline),
            )
            conn.commit()
            st.success("User registered successfully")
            controller.set("mini_user", username)
            controller.set("mini_token", token)
            time.sleep(1)
            st.rerun()
        cursor.close()
        conn.close()


# Function to handle user login
def login():
    st.subheader("Login")
    username = st.text_input("Username", key="login_username")
    token = st.text_input("Token", key="login_token")
    if st.button("Login"):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM users WHERE username = %s AND token = %s", (username, token)
        )
        if cursor.fetchone():
            st.success("Logged in successfully")
            controller.set("mini_user", username)
            controller.set("mini_token", token)
            time.sleep(1)
            st.rerun()
        else:
            st.error("Invalid username or token")
        cursor.close()
        conn.close()


def logout():
    controller.remove("mini_user")
    controller.remove("mini_token")


# Function to display cards after login
def display_cards():
    with st.sidebar:
        st.write(f"Signed in as: `{st.session_state.username}`")
        with st.expander("Token"):
            st.code(st.session_state.token, language="plaintext")

        st.button("Logout", on_click=logout)

    solves = get_solves(st.session_state.user_id)
    st.header("Challenges")

    for i in range((len(challenges) + 2) // 3):
        cols = st.columns(3)
        for j in range(3):
            if i * 3 + j >= len(challenges):
                break
            challenge = challenges[i * 3 + j]
            col = cols[j]
            with col:
                container = st.container(border=True)
                container.subheader(challenge["name"])
                container.markdown(challenge["description"])
                if (st.session_state.user_id, challenge["id"]) in solves:
                    container.success("Solved")
                else:
                    flag = container.text_input("Flag", key=challenge["name"])
                    if flag:
                        if flag == challenge["flag"]:
                            solve(st.session_state.user_id, challenge["id"])
                            st.rerun()
                        else:
                            container.error("Incorrect flag")

    st.header("Scores")
    scores = get_scores()
    scores_df = pd.DataFrame(
        scores, columns=["Username", "Solve Count", "Challenge IDs"]
    )
    st.dataframe(scores_df, use_container_width=True)

    st.header("Users")
    users = get_users()
    users_df = pd.DataFrame(users, columns=["ID", "Username", "Experienced", "Offline"])
    st.dataframe(users_df, use_container_width=True, hide_index=True)


# Main function
def main():
    set_state()
    st.title(ctf["name"])
    st.markdown(ctf["description"])

    if "logged_in" not in st.session_state:
        st.session_state.logged_in = False

    if st.session_state.logged_in:
        display_cards()
    else:
        option = st.selectbox("Choose an option", ["Login", "Register"])
        if option == "Login":
            login()
        elif option == "Register":
            register()

if __name__ == "__main__":
    main()
