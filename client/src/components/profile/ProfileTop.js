import React from 'react'
import PropTypes from 'prop-types'

const ProfileTop = ({profile}) => {
    
    return (
        <div class="profile-top bg-primary p-2">
            <img
                class="round-img my-1"
                src={profile.user.avatar}
                alt=""
            />
            <h1 class="large">{profile.user.name}</h1>
            <p class="lead">{profile.status} at {profile.company && <span>{profile.company}</span>}</p>
            <p>{profile.location}</p>
            <div class="icons my-1">
                {profile.website && 
                    <a href={profile.website} target="_blank" rel="noopener noreferrer">
                    <i class="fas fa-globe fa-2x"></i>
                    </a>
                }
                {profile.social && profile.social.twitter && 
                    <a href={profile.social.twitter} target="_blank" rel="noopener noreferrer">
                    <i class="fab fa-twitter fa-2x"></i>
                    </a>
                }
                {profile.social && profile.social.facebook && 
                    <a href={profile.social.facebook} target="_blank" rel="noopener noreferrer">
                    <i class="fab fa-facebook fa-2x"></i>
                    </a>
                }
                {profile.social && profile.social.linkedin && 
                    <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer">
                    <i class="fab fa-linkedin fa-2x"></i>
                    </a>
                }
                {profile.social && profile.social.youtube && 
                    <a href={profile.social.youtube} target="_blank" rel="noopener noreferrer">
                    <i class="fab fa-youtube fa-2x"></i>
                    </a>
                }
                {profile.social && profile.social.instagram && 
                    <a href={profile.social.instagram} target="_blank" rel="noopener noreferrer">
                    <i class="fab fa-instagram fa-2x"></i>
                    </a>
                }  
            </div>
    </div>
    )
}
ProfileTop.propTypes = {
   profile: PropTypes.object.isRequired,
}

export default ProfileTop
